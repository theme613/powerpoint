fetch('https://www.pinterest.com/search/pins/?q=nature')
    .then(r => r.text())
    .then(t => {
        const images = [];
        const regex = /"url":"(https:\/\/i\.pinimg\.com\/[a-zA-Z0-9_x]+\/[a-f0-9\/]+\.jpg)"/g;
        let match;
        while ((match = regex.exec(t)) !== null) {
            images.push(match[1]);
        }
        console.log([...new Set(images)].slice(0, 5));
    })
    .catch(console.error);
