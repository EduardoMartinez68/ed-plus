function nextWeb(url){
    window.location.href = "/links/"+url; 
    /*
    url='/links/'+url;
    if (!url.startsWith('/')) {
        url = '/' + url;
    }

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error('Error cargando vista');
      return response.text();
    })
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newContent = doc.querySelector('#app-content');
      const app = document.querySelector('#app-content');

      if (newContent && app) {
        app.innerHTML = newContent.innerHTML;
        history.pushState(null, '', url);

        const scripts = newContent.querySelectorAll('script');
        scripts.forEach(oldScript => {
          const newScript = document.createElement('script');
          if (oldScript.src) {
            newScript.src = oldScript.src;
          } else {
            newScript.textContent = oldScript.textContent;
          }
          document.body.appendChild(newScript);
        });
      }
    })
    .catch(err => {
      console.error('Fallo cargando vista SPA:', err);
      alert('Ocurrió un error al cambiar de vista. Intenta de nuevo.');
    });

    //window.location.href = "/links/"+url; 
    */
}