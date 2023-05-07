import { useEffect, useRef, useState } from 'react';

export interface SelectOption {
    label: string;
    id: string;
    hovered?: boolean;
}

interface SearchableSelectProps {
    onSelection: (selectedId: string) => void;
    /** If omitted, the select will behave synchronously  */
    onSearch?: (searchTerm: string) => Promise<SelectOption[]>;
    forwardClearDelegate?: (clearFunction: () => void) => void;
    /** default: `'Placeholder'` */
    placeholder?: string;
    /** Initial options. The select will use this as source if no onSearch is set */
    options?: SelectOption[];
    /** default: `400` */
    debounceTime?: number;
    createTag: (tag: string) => Promise<void>;
}

function debounce(fn: any, delay: number) {
    let lastTimeoutId: any;

    const _args = arguments;

    return function () {
        clearTimeout(lastTimeoutId);

        lastTimeoutId = setTimeout(function () {
            fn.apply(null, _args), delay;
        });
    } as (...args: any[]) => void;
}

export default function SearchableSelect({
    debounceTime,
    onSearch,
    onSelection,
    options,
    forwardClearDelegate,
    placeholder,
    createTag,
}: SearchableSelectProps) {
    options = options || [];
    debounceTime = onSearch ? debounceTime || 400 : 0;
    placeholder = placeholder || 'Type to Search';

    if (typeof forwardClearDelegate === 'function') {
        forwardClearDelegate(() => {
            console.log('insideDelegate');
            setSearchTerm('');
        });
    }

    const [a_results, setResults] = useState(options);
    const [s_searchTerm, setSearchTerm] = useState('');
    const [b_isSearching, setIsSearching] = useState(false);
    const [s_optionIdHovered, setOptionIdHovered] = useState('');
    const [b_showResults, setShowResults] = useState(false);

    const debouncedSearch = useRef(debounce(filterOptions, debounceTime));

    async function filterOptions(s_searchTerm: string) {
        try {
            setIsSearching(true);

            if (onSearch) {
                const a_searchResults = await onSearch(s_searchTerm);
                setResults(a_searchResults);
            } else {
                const r_regexp = RegExp(s_searchTerm, 'i');
                const a_filteredOptions = a_results.filter((o_option) =>
                    o_option.label.match(r_regexp)
                );

                if (a_filteredOptions.length) {
                    setOptionIdHovered(a_filteredOptions[0].id);
                }
            }

            setShowResults(true);
            setIsSearching(false);
        } catch (e) {
            console.error('search failed: ', e);
            setIsSearching(false);
        }
    }

    useEffect(() => {
        if (b_isSearching || !s_searchTerm.trim()) {
            return;
        }

        const o_selection = a_results.find(
            (o_result) => o_result.label === s_searchTerm
        );

        if (o_selection) {
            return;
        }

        debouncedSearch.current(s_searchTerm);
    }, [a_results, b_isSearching, s_searchTerm]);

    const showCreateButton =
        !b_isSearching && s_searchTerm.trim() && !a_results.length;

    const [b_isMouseDownParent, setIsMouseDownParent] = useState(false);

    return (
        <div
            onFocus={() => setShowResults(true)}
            // Mouse down/up to check if an option was clicked (click down inside element) or the click was outside
            // this element. If that's not handled, the click on the options is not registered, since those are
            // hidden on this element's blur
            onMouseDown={() => setIsMouseDownParent(true)}
            onBlur={() => !b_isMouseDownParent && setShowResults(false)}
            onMouseUp={() => setIsMouseDownParent(false)}
        >
            <input
                className="form-select"
                type="text"
                value={s_searchTerm}
                onInput={(ev) => setSearchTerm(ev.currentTarget.value)}
                placeholder={placeholder}
            ></input>

            <div
                className="results"
                style={{
                    position: 'absolute',
                    background: 'white',
                    marginTop: '0.2rem',
                    border: '1px solid #187bf2',
                    zIndex: '100',
                    maxHeight: '200px',
                    overflowY: 'scroll',
                    whiteSpace: 'nowrap',
                    minWidth: '200px',
                    display:
                        b_showResults && (a_results.length || showCreateButton)
                            ? 'block'
                            : 'none',
                }}
            >
                {a_results.map((o_result) => {
                    const style: any = {
                        height: '28px',
                        padding: '5px 3px',
                        cursor: 'pointer',
                    };

                    if (s_optionIdHovered === o_result.id) {
                        style.color = 'white';
                        style.backgroundColor = '#607799';
                    }

                    return (
                        <div
                            key={o_result.id}
                            style={style}
                            onMouseEnter={() => setOptionIdHovered(o_result.id)}
                            onClick={() => {
                                setSearchTerm('');
                                setShowResults(false);
                                onSelection(o_result.id);
                                filterOptions('');
                            }}
                        >
                            {o_result.label}
                        </div>
                    );
                })}
                {showCreateButton && (
                    <button
                        type="button"
                        style={{ height: '28px', padding: '5px 3px' }}
                        onClick={() => {
                            createTag(s_searchTerm);
                            setSearchTerm('');
                        }}
                    >
                        Add &quot;{s_searchTerm}&quot;
                    </button>
                )}
            </div>
        </div>
    );
}
