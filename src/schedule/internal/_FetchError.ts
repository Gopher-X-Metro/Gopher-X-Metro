/** The error that returns when relating to fetching of schedule data */
export default class _FetchError extends Error {
    constructor (message: any) {
        super(message);

        this.name = "FetchError";
    }
}