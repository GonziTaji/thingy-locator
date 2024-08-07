import { RefObject, useEffect, useRef, useState } from 'react';
import TagSelect from './TagSelect';

interface Thingy {
    name: string;
    location: string;
    tags: string[];
}

const THINGY_LIST_STORAGE_KEY = 'gt_thingy_list';

interface ThingyFormProps {
    addThingy: (thingy: Thingy) => void;
}

const ThingyForm = ({ addThingy }: ThingyFormProps) => {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [tags, setTags] = useState<string[]>([]);

    const nameInputRef = useRef<HTMLInputElement>(null);
    const locationInputRef = useRef<HTMLInputElement>(null);

    function onTagSelection(selectedTag: string) {
        if (selectedTag && -1 === tags.indexOf(selectedTag)) {
            setTags([selectedTag, ...tags]);
        }
    }

    function removeTag(tagToRemove: string) {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    }

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

        addThingy({ name, location, tags });
        setName('');
        setLocation('');
        setTags([]);
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

            <span>Add some words that help you remember the thing</span>

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

            <TagSelect onSelection={onTagSelection} />

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

    useEffect(() => {
        let thingiesInStorage = localStorage.getItem(THINGY_LIST_STORAGE_KEY);

        if (thingiesInStorage) {
            try {
                thingiesInStorage = JSON.parse(thingiesInStorage);
                console.log(thingiesInStorage);

                if (
                    Array.isArray(thingiesInStorage) &&
                    thingiesInStorage.length
                ) {
                    setThingyList(thingiesInStorage);
                }
            } catch (e: any) {
                alert(
                    `Tasks in localstorage could not be loaded because of an error: ${e.message}. \nStarting fresh!`
                );
                console.error(e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(
            THINGY_LIST_STORAGE_KEY,
            JSON.stringify(thingyList)
        );
    }, [thingyList]);

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
