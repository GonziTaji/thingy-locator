import {
    Dispatch,
    RefObject,
    SetStateAction,
    useEffect,
    useRef,
    useState,
} from 'react';

interface Thingy {
    name: string;
    location: string;
    tags: string[];
}

interface ThingyFormProps {
    addThingy: (thingy: Thingy) => void;
}

const ThingyForm = ({ addThingy }: ThingyFormProps) => {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');

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
        >
            <input
                className="px-1 py-1 block border border-gray-100"
                type="text"
                value={name}
                onInput={(ev) => setName(ev.currentTarget.value)}
                placeholder="How is the thingy called?"
                ref={nameInputRef}
                required
            />
            <input
                className="px-1 py-1 block border border-gray-100"
                type="text"
                value={location}
                onInput={(ev) => setLocation(ev.currentTarget.value)}
                placeholder="Where it is?"
                ref={locationInputRef}
                required
            />

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
