class Hash {
    // Hash class constructor
    constructor (contents: string | undefined, keyIndex?: number) {
        this.hash = new Map<string, Set<string>>();

        if (contents) {
            if (keyIndex !== undefined) {
                contents.split(/\r\n/).slice(1).forEach(line => {
                    let sections = line.split(/,/)
        
                    if (!this.hash.has(sections[keyIndex]))
                        this.hash.set(sections[keyIndex], new Set());
        
                    this.hash.get(sections[keyIndex])?.add(line);
                });
            } else {
                Object.entries(JSON.parse(contents)).forEach((entry) => {
                    const [key, value] = entry;
        
                    //@ts-ignore
                    this.hash.set(key, new Set(value));
                })
            }
        } else console.warn("Empty Input");
    }

    // Returns the hashmap
    public get(key: string) : Set<string> | undefined { return this.hash.get(key); }
    
    // Converts the Hash to a JSON string
    public toJSON() : string {
        let storage = new Map<string, string[]>();

        this.hash.forEach((value, key) => storage.set(key, Array.from(value))) 

        return JSON.stringify(Object.fromEntries(storage)); 
    }

    private hash : Map<string, Set<string>>;
}

export default Hash;