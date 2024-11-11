/** The error that returns when relating to existence of cache */
export default class _CacheError extends Error {
    constructor (message: any) {
        super(message);

        this.name = "CacheError";
    }
}