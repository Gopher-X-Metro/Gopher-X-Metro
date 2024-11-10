/** The error that returns when relating to existence of user */
export default class _ExistsError extends Error {
    constructor (message: any) {
        super(message);

        this.name = "ExistsError";
    }
}