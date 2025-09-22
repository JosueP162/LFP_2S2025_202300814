export const errors = []

export function clearErrors() {
    errors.length = 0;
}

export function addError(error) {
    errors.push(error);
}