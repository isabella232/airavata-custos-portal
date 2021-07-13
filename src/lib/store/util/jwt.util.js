import decode from "jwt-decode";


export function hasTokenExpired(token) {
    const expirationDate = getTokenExpirationDate(token);
    return expirationDate < new Date();
}

export function getTokenExpirationDate(encodedToken) {
    if (!encodedToken) {
        return null;
    }

    const token = decode(encodedToken);
    if (!token.exp) {
        return null;
    }

    const date = new Date(0);
    date.setUTCSeconds(token.exp);
    return date;
}