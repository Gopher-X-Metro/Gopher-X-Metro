export default class _ExistsError extends Error {
    constructor (message: any) {
        super(message);

        this.name = "ExistsError";
    }
}