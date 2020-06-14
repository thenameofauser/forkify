import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import { elements, renderLoader, clearLoader } from './views/base';


/* Global state of the app
* - Search object
* - Current recipe object
* - Shopping list object
* - Liked recipes
We have everything here, accessible in one place accessible to everything inside of this module
*/

const state = {};

/**
 * Search Controller
 * 
 */


const controlSearch = async () => {
    // 1. Get the query from view
    const query = searchView.getInput(); //TODO
    


    if (query) {
        // 2. New search object and add to state
        state.search = new Search(query);

        // 3. Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        
        try {
            // 4. Search for recipes 
            await state.search.getResults();
            
    
            // 5. Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
            
        } catch (error) {
            alert('Something wrong with the search');
            clearLoader();
        }

        

    }
}

elements.searchForm.addEventListener('submit', e=> {
    e.preventDefault(); //prevents page from reloading
    controlSearch(); //the function is called whenever search is clicked
});




elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});


/*
const search = new Search('pizza');
console.log(search);
search.getResults();
*/

/*
 * Recipe controller
 * 
 */
const controlRecipe = async () => {
    // Get ID from url
    const id = window.location.hash.replace('#', '');

    if (id) {
        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // HIghlight selected search item
        if (state.search) searchView.highlightSelected(id);


        // Create new recipe object
        state.recipe = new Recipe(id);


        

        try {
        // Get recipe data and parse ingredients
        await state.recipe.getRecipe();
        console.log(state.recipe);
        console.log(state.recipe.ingredients);
        state.recipe.parseIngredients();
        
        // Calculate servings and time
        state.recipe.calcTime();
        state.recipe.calcServings();

        // Render the recipe
        clearLoader();
        recipeView.renderRecipe(state.recipe);

        } catch (error) {
            console.log(error);
           alert (error);

        }


    }

};
 
/*
 window.addEventListener('hashchange', controlRecipe);
 window.addEventListener('load', controlRecipe);
 */

 ['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

 /**
  * LIST CONTROLLER
  */

  const controlList = () => {
      // Create a new list IF there is none yet
      if (!state.list) state.list = new List();

      // Add each ingredient to the list and UI
      state.recipe.ingredients.forEach(el => {
          const item = state.list.addItem(el.count, el.unit, el.ingredient);
          listView.renderItem(item);

      });
  };



 // Handling recipe button clicks
 elements.recipe.addEventListener('click', e=> {
     // asterisk means all child elements of the chosen element, as the click might happen on child elements as well as on the parent one
     if (e.target.matches('.btn-decrease, .btn-decrease *')) {
         // Decrease button is clicked
         if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
         };
     } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipte__btn, .recipe_btn--add *')) {
    controlList();
    } 
 });

window.l = new List();