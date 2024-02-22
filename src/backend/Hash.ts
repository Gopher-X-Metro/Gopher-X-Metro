class Hash<KeyType> {

    /* Public */
    
    /**
     * Hash Class Constructor
     * @param contents contents of the file or json
     * @param keyIndex index that will be used for key, leave empty for json file
     */
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
    /**
     * Get the string according to the key that was assigned to it
     * @param key key to retrieve a certian string in the hash
     */
    public get(key: KeyType) : string[] | undefined { return this.hash.get(key); }
    /**
     * Converts the Hash object to a json string
     */
    public toJSON() : string { return JSON.stringify(Object.fromEntries(this.hash)); }

    /* Private */
    
    private hash : Map<KeyType, string[]>;
}

export default Hash;