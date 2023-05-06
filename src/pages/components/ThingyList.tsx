import { Dispatch, RefObject, SetStateAction, useRef, useState } from 'react';
import SearchableSelect from './SearchableSelect';

interface Thingy {
    name: string;
    location: string;
    tags: string[];
}

const __tags = ['ropa', 'herramientas', 'muebles'];

interface TagSelectorProps {
    tags: string[];
    setTags: Dispatch<SetStateAction<string[]>>;
}

const TagSelector = ({ tags, setTags }: TagSelectorProps) => {
    const [knownTags, setKnownTags] = useState<string[]>(__tags);

    // async to mimic request to server
    async function createTag(newTag: string) {
        if (!newTag) {
            throw 'tag cannot be empty';
        }

        setKnownTags([...knownTags, newTag]);
        setTags([...tags, newTag]);
    }

    function onTagSelection(selectedTag: string) {
        if (selectedTag && -1 === tags.indexOf(selectedTag)) {
            setTags([selectedTag, ...tags]);
        }
    }

    async function searchTags(term: string) {
        return term.trim()
            ? getOptionsFromTags(
                  knownTags.filter((tag) => new RegExp(term, 'i').test(tag))
              )
            : getOptionsFromTags(knownTags);
    }

    function getOptionsFromTags(_tags: string[]) {
        return _tags.map((tag) => ({
            label: tag,
            id: tag,
            hovered: false,
        }));
    }

    function removeTag(tagToRemove: string) {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    }

    return (
        <div>
            <div className="flex gap-3">
                {tags.map((tag, i) => (
                    <div
                        key={i}
                        className="flex align-middle border border-slate-500 bg-sky-100 rounded-lg pe-4 py-1"
                    >
                        <button
                            className="text-slate-700 font-bold px-2"
                            type="button"
                            onClick={() => removeTag(tag)}
                        >
                            x
                        </button>
                        <span className="text-slate-400">|</span>
                        <span className="ps-2">{tag}</span>
                    </div>
                ))}
            </div>
            <SearchableSelect
                onSearch={searchTags}
                onSelection={onTagSelection}
                options={getOptionsFromTags(knownTags)}
                placeholder="Search or create a keyword"
                createTag={createTag}
            />
        </div>
    );
};

interface ThingyFormProps {
    addThingy: (thingy: Thingy) => void;
}

const ThingyForm = ({ addThingy }: ThingyFormProps) => {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [tags, setTags] = useState<string[]>([]);

    const nameInputRef = useRef<HTMLInputElement>(null);
    const locationInputRef = useRef<HTMLInputElement>(null);

    function addThingyAndClear() {
        const refs: [RefObject<HTMLInputElement>, string][] = [
            [nameInputRef, 'The thingy needs a name!'],
            [locationInputRef, 'The thingy cannot be nowhere!'],
        ];

        for (const [inputRef, invalidMessage] of refs) {
            if (inputRef.current) {
                if (inputRef.current.validity.valueMissing) {
                    inputRef.current.setCustomValidity(invalidMessage);
                    inputRef.current.reportValidity();
                    return;
                }
            }
        }

        addThingy({
            name,
            location,
            tags: [],
        });

        setName('');
        setLocation('');
    }

    return (
        <form
            onSubmit={() => {}}
            onKeyDown={(ev) => ev.code === 'Enter' && addThingyAndClear()}
            className="flex flex-col gap-1"
        >
            <input
                className="px-2 py-1 block border border-gray-400"
                type="text"
                value={name}
                onInput={(ev) => setName(ev.currentTarget.value)}
                placeholder="How is the thingy called?"
                ref={nameInputRef}
                required
            />
            <input
                className="px-2 py-1 block border border-gray-400"
                type="text"
                value={location}
                onInput={(ev) => setLocation(ev.currentTarget.value)}
                placeholder="Where it is?"
                ref={locationInputRef}
                required
            />

            <div>
                <span>Add some words that help you remember the thing</span>
                <TagSelector tags={tags} setTags={setTags} />
            </div>

            <button
                className="px-2 py-1 border border-gray-400 bg-gray-200"
                type="button"
                onClick={addThingyAndClear}
            >
                Add the thing!
            </button>
        </form>
    );
};

export default function ThingyList({ className }: { className: string }) {
    const [thingyList, setThingyList] = useState<Thingy[]>([]);

    function addThingy(thingy: Thingy) {
        setThingyList([thingy, ...thingyList]);
    }

    return (
        <main className={' ' + className}>
            <h1 className="text-xl">Add a thingy!</h1>

            <ThingyForm addThingy={addThingy} />

            <h2 className="text-lg">My Thingies</h2>

            <ul>
                {thingyList.map((thingy, i) => (
                    <li key={'li-' + i}>
                        <span>{thingy.name}</span>
                        <span>{thingy.location}</span>
                    </li>
                ))}
            </ul>
        </main>
    );
}
