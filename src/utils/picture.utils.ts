function convertImageUrlToImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        if (!url) {
            reject('Error: Given picture url is empty');
            return;
        }

        const image = new Image();
        image.onload = () => {
            resolve(image);
        };
        image.onerror = (ev: unknown) => reject(ev);
        image.src = url;
    });
}

function convertBlobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = () => {
            if (fileReader.result) {
                resolve(fileReader.result as string);
            } else {
                reject('Failed to read file');
            }
        };
        fileReader.readAsDataURL(blob);
    });
}

function resizeImage(image: HTMLImageElement, newWidth: number, newHeight: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');

        canvas.width = newWidth;
        canvas.height = newHeight;

        const context = canvas.getContext('2d');
        if (!context) {
            reject('Failed to get canvas context');
            return;
        }
        context.drawImage(image, 0, 0, newWidth, newHeight);
        canvas.toBlob(
            im => {
                if (!im) {
                    reject('Failed to create blob from canvas');
                    return;
                }
                resolve(im);
            },
            'image/jpeg',
            9,
        );
    });
}

export function resizePicture(blob: Blob, maxWidth: number): Promise<string> {
    return convertBlobToDataUrl(blob).then(url => resizePictureUrl(url, maxWidth));
}

export function resizePictureUrl(imageUrl: string, maxWidth: number): Promise<string> {
    return convertImageUrlToImage(imageUrl).then(image => {
        if (image.naturalWidth <= maxWidth) {
            return Promise.resolve(imageUrl);
        }

        const width = maxWidth;
        const height = (image.naturalHeight / image.naturalWidth) * width;
        return resizeImage(image, width, height).then(blob => convertBlobToDataUrl(blob));
    });
}
