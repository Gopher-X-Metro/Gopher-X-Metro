class Hash<KeyType> {
    // Hash class constructor
    constructor (contents: string | undefined, keyIndex?: number) {
        this.hash = new Map<KeyType, string[]>();

        if (contents) {
            if (keyIndex !== undefined) {
                contents.split(/\r\n/).slice(1).forEach(line => {
                    const key = line.split(/,/)[keyIndex]

                    if (!this.hash.has(key as KeyType))
                        this.hash.set(key as KeyType, new Array<string>());
        
                    this.hash.get(key as KeyType)?.push(line);
                });
            } else {
                // If no key provided, information is assumed to be from JSON file
                Object.entries(JSON.parse(contents)).forEach(entry => this.hash.set(entry[0] as KeyType, entry[1] as string[]))
            }
        } else console.warn("Empty Input");
    }

    // Returns the hashmap
    public get(key: KeyType) : string[] | undefined { return this.hash.get(key); }
    
    // Converts the Hash to a JSON string
    public toJSON() : string { return JSON.stringify(Object.fromEntries(this.hash)); }

    private hash : Map<KeyType, string[]>;
}

export default Hash;