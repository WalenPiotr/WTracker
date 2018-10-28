export default (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const image: HTMLImageElement = new Image();
        image.onload = () => {
            resolve(image);
        };
        image.onerror = () => {
            reject(new Error());
        };
        image.src = src;
    });
};
