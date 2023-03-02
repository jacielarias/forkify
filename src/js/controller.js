//import { async } from 'regenerator-runtime';
//import { get } from 'core-js/core/dict';
import * as model from './model.js'
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookMarksView from './views/bookMarksView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';

// https://forkify-api.herokuapp.com/v2

const controlRecipes = async function(){
  try{
    const id = window.location.hash.slice(1); //Obtenemos el id dinamicamente y quitamos el primer caracter (#) con slice();
    
    if(!id) return;
    recipeView.renderSpiner();

    resultsView.update(model.getSearchResultsPage());
    
    //Actualizar vista de marcadores
    bookMarksView.update(model.state.bookmarks);

    //Cargar receta
    await model.loadRecipe(id);
    
    //Rendering recipe
    recipeView.render(model.state.recipe);

  }catch(err){
    recipeView.renderError()
    console.error(err)
  }
}

const controlSearchResults = async function() {
  try{
    resultsView.renderSpiner();

    const query = searchView.getQuery();
    if(!query) return;
    
    await model.loadSearchResults(query)

    resultsView.render(model.getSearchResultsPage());

    paginationView.render(model.state.search)
  }catch(err){
    console.log(err)
  }
}

const controlPagination = function (goToPage) {
  resultsView.render(model.getSearchResultsPage(goToPage));

  paginationView.render(model.state.search)
}

const controlServings = function(newServings) {
  //Actualizar porciones de la receta
  model.updateServings(newServings);
  
  //Actualizar la vista de la receta
  //recipeView.render(model.state.recipe)
  recipeView.update(model.state.recipe)
}

const controlAddBookmark = function() {
  //Agregar o remover marcador
  if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe)
  else model.deleteBookmark(model.state.recipe.id)
  //Actualizar receta
  recipeView.update(model.state.recipe)
  //Mostrar marcador
  bookMarksView.render(model.state.bookmarks)
}; 

const controlBookmarks = function() {
  bookMarksView.render(model.state.bookmarks)
};

const controlAddRecipe = async function(newRecipe) {
  try{
    //Show loading Spiner
    addRecipeView.renderSpiner();

    //Subir nueva receta
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe)
    
    //Renderizar receta
    recipeView.render(model.state.recipe);
   
    //Mesaje de éxito
    addRecipeView.renderMessagge();

    //Bookmark vista
    bookMarksView.render(model.state.bookmarks);

    //Cambiar id en la URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    //window.history.back();

    //Cerra ventana de formulario
    setTimeout(function() {
      addRecipeView.toggleWindow()
    }, MODAL_CLOSE_SEC * 1000)

  }catch(err){
    console.log('🫠', err)
    addRecipeView.renderError(err.message)
  }
};

const init = function() {
  bookMarksView.addHandlerRender(controlBookmarks)
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark)
  searchView.addHandlerSeacrh(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
