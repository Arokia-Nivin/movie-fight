//debounce function to the delay the api request 
const debounce= (functodelay, delaytime)=>{
    let timeoutId; 
    return (e)=>{
        if (timeoutId){
            clearTimeout(timeoutId);
        }
        timeoutId= setTimeout(()=>{
            functodelay(e); 
        },delaytime); 
    }
}
const noImageURL="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png";

function createAutoComplete({root,fetchData,renderOption,inputValue,onOptionSelect}){
    root.innerHTML = `
    <label><b>Search For a Movie</b></label>
    <input type="text" class="input" />
    <div class="dropdown">
        <div class="dropdown-menu">
        <div class="dropdown-content results"></div>
        </div>
    </div>
    `;

    const input = root.querySelector('input');
    const dropdown = root.querySelector('.dropdown');
    const results = root.querySelector('.results');

    //fetch movies
    const onType= async (e)=>{
        const itemsList= await fetchData(e.target.value.trim());
        
        if (itemsList.length===0){
            //hide the dropdown menu 
            dropdown.classList.remove('is-active'); 
            return ; 
        }
        results.innerHTML=''; 
        //show the dropdown menu  
        dropdown.classList.add('is-active');
        for (let item of itemsList){
            //create 'a' tag
            const option= document.createElement('a'); 
           
            //item of the dropdown menu 
            option.classList.add('dropdown-item'); 
        
            option.innerHTML=renderOption(item); 
            //appending to the dropdown menu 
            results.appendChild(option); 

            //listen to click event of options 
            option.addEventListener('click',()=>{
                dropdown.classList.remove('is-active'); 
                input.value=inputValue(item); 
                onOptionSelect(item);
            });

        }

    }
    //on page load debounce func runs 
    input.addEventListener('input', debounce(onType,500)); 

    //hide the dropdown menu when any element outside the dropdown menu is clicked  
    document.addEventListener('click',({target})=>{
        if (!root.contains(target))
            dropdown.classList.remove('is-active'); 
    })
}

//some util functions 
functions={
    fetchData: async (searchmovie)=>{
        const res= await axios.get("https://www.omdbapi.com/",{
            params:{
                apikey:'d9835cc5',
                s: searchmovie  
            }   
        }) 
        if (res.data.Error) return [];
        return res.data.Search; 
    }, 

    renderOption:(movie)=>{
        if (movie.Poster==='N/A') movie.Poster=noImageURL;
        return `
        <img src="${movie.Poster}" />
        <p>${movie.Title}</p>
        `;

    },
    inputValue:(movie)=>{
        return movie.Title; 
    }
}

//leftside 
createAutoComplete({
    ...functions, 
    root: document.querySelector('#left-autocomplete'), 
    onOptionSelect(movie){
        document.querySelector('.tutorial').classList.add('is-hidden');
        onMovieSelect(movie, document.querySelector('#left-summary'), 'left');

    }  
});
//rightside 
createAutoComplete({
    ...functions, 
    root:document.querySelector("#right-autocomplete"),
    onOptionSelect(movie){
        document.querySelector('.tutorial').classList.add('is-hidden');
        onMovieSelect(movie, document.querySelector('#right-summary'), 'right');
    }  
})



//boolean variables 
let leftMovie=false;
let rightMovie=false;
//second request 
const onMovieSelect = async (movie,element,side) => {
    const response = await axios.get('https://www.omdbapi.com/', {
      params: {
        apikey: 'd9835cc5',
        i: movie.imdbID
      }
    });
    element.innerHTML = movieTemplate(response.data);
    if (side === 'left') 
        leftMovie = true;
    else 
        rightMovie = true;
    
    if (leftMovie && rightMovie){
        Compare(); 
    }
};

//comparison function 
const Compare = () => {
    const leftSideStats = document.querySelectorAll('#left-summary .notification');
    const rightSideStats = document.querySelectorAll('#right-summary .notification');
  
    leftSideStats.forEach((leftStat, index) => {
      const rightStat = rightSideStats[index];
      const leftSideValue = parseFloat(leftStat.dataset.value);
      const rightSideValue = parseFloat(rightStat.dataset.value);
      if (!isNaN(rightSideValue) && !isNaN(rightSideValue)){
            if (rightSideValue > leftSideValue) {
                leftStat.classList.remove('is-primary');
                leftStat.classList.add('is-warning');
            } else if (leftSideValue>rightSideValue){
                rightStat.classList.remove('is-primary');
                rightStat.classList.add('is-warning');
            }
        }
    });
  };


//movie template 
const movieTemplate = movieDetail => {
    const metascore = parseFloat(movieDetail.Metascore);
    const imdbRating = parseFloat(movieDetail.imdbRating);
    const imdbVotes = parseFloat(movieDetail.imdbVotes.replace(/,/g, ''));
    const awards = movieDetail.Awards.split(' ').reduce((prev, word) => {
      const value = parseInt(word);
      if (isNaN(value)) {
        return prev;
      } else {
        return prev + value;
      }
    }, 0);
  
    return `
      <article class="media">
        <figure class="media-left">
          <p class="image">
            <img src="${movieDetail.Poster==='N/A'?noImageURL:movieDetail.Poster}" />
          </p>
        </figure>
        <div class="media-content">
          <div class="content">
            <h1>${movieDetail.Title}</h1>
            <h4>${movieDetail.Genre}</h4>
            <p>${movieDetail.Plot}</p>
          </div>
        </div>
      </article>
  
      <article data-value=${awards} class="notification is-primary">
        <p class="title">${movieDetail.Awards}</p>
        <p class="subtitle">Awards</p>
      </article>
      <article data-value=${metascore} class="notification is-primary">
        <p class="title">${movieDetail.Metascore}</p>
        <p class="subtitle">Metascore</p>
      </article>
      <article data-value=${imdbRating} class="notification is-primary">
        <p class="title">${movieDetail.imdbRating}</p>
        <p class="subtitle">IMDB Rating</p>
      </article>
      <article data-value=${imdbVotes} class="notification is-primary">
        <p class="title">${movieDetail.imdbVotes}</p>
        <p class="subtitle">IMDB Votes</p>
      </article>
    `;
};
  

