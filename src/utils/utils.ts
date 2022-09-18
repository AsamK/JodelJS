export function toFormUrlencoded(form: {
    [key: string]: string | number | boolean | undefined;
}): string {
    return Object.keys(form)
        .filter(key => form[key] != null)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(form[key]!))
        .join('&');
}
