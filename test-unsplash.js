fetch('https://unsplash.com/napi/search/photos?query=nature&per_page=10')
    .then(r => r.json())
    .then(data => console.log(data.results.map(r => r.urls.small)))
    .catch(console.error);
