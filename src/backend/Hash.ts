class Hash<T> {

    /* Public */
    
    /**
     * Hash Class Constructor
     * @param contents contents of the file or json
     * @param keyIndex index that will be used for key, leave empty for json file
     */
    constructor (contents: string | undefined, keyIndex?: number) {
        this.hash = new Map<T, string[]>();

        if (contents) {
            if (keyIndex !== undefined) {
                contents.split(/\r\n/).slice(1).forEach(line => {
                    const key = line.split(/,/)[keyIndex]

                    if (!this.hash.has(key as T))
                        this.hash.set(key as T, new Array<string>());
        
                    this.hash.get(key as T)?.push(line);
                });
            } else {
                // If no key provided, information is assumed to be from JSON file
                Object.entries(JSON.parse(contents)).forEach(entry => this.hash.set(entry[0] as T, entry[1] as string[]))
            }
        } else console.warn("Empty Input");
    }
    /**
     * Get the string according to the key that was assigned to it
     * @param key key to retrieve a certian string in the hash
     */
    public get(key: T) : string[] | undefined { return this.hash.get(key); }
    /**
     * Converts the Hash object to a json string
     */
    public toJSON() : string { return JSON.stringify(Object.fromEntries(this.hash)); }

    /* Private */
    
    private hash : Map<T, string[]>;
}

export default Hash;