/** The error that returns when relating to existence of data */
export default class _ExistsError extends Error {
    constructor (message: any) {
        super(message);

        this.name = "ExistsError";
    }
}