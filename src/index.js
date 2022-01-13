import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import ImagesApiService from './js/img-service';
import hitsTpl from './templates/hits.hbs';
import LoadMoreBtn from './js/load-more-btn';
import gallery from './css/gallery.css';

const imagesApiService = new ImagesApiService();
const loadMoreBtn = new LoadMoreBtn();
const refs = {
  form: document.querySelector('#search-form'),
  imageCard: document.querySelector('.gallery'),
  textInput: document.querySelector('input'),
};

const handlingHits = async () => {
  try {
    const { data, config } = await imagesApiService.fetchImages();
    const totalImages = data.totalHits; // Кол-во найденных изображений
    const amountOfImages = data.hits.length; // Длина массива найденных изображений
    const currentPageNumber = config.params.page; // Номер загруженной страницы
    const amountUploadedImages = config.params.per_page; // Кол-во загружаемых за раз страниц
    const sumUploadedImages = amountUploadedImages * currentPageNumber; // Сумма загруженных изображений

    //  Если бэкэнд ничего не вернул
    if (amountOfImages === 0) {
      return Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again',
      );
    }

    //  Выводим сообщение о кол-ве найденных изображений
    if (currentPageNumber === 1) {
      Notiflix.Notify.info(`Hooray! We found ${totalImages} images.`);
    }

    //  Рэндэрим  полученные изображения
    appendImagesCard(data.hits);

    if (currentPageNumber > 1) {
      smoothScrolling();
    }

    loadMoreBtn.show();

    //  Если вывели все изображения, полученные от бэкэнда
    if (sumUploadedImages > totalImages) {
      loadMoreBtn.hide();
      refs.textInput.value = '';

      return Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    }
  } catch (error) {
    Notiflix.Notify.warning('Sorry, there is a problem. Try later.');
    console.log('Error', error.message);
  }
};

refs.form.addEventListener('submit', onSearchForm);
loadMoreBtn.refs.button.addEventListener('click', handlingHits);
loadMoreBtn.hide();

//===== SimpleLightbox =====
let lightbox = new SimpleLightbox('.gallery a');

function onSearchForm(e) {
  e.preventDefault();

  imagesApiService.searchQuery = e.currentTarget.elements.searchQuery.value;

  if (imagesApiService.searchQuery.trim() === '') {
    return Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again',
    );
  }

  imagesApiService.resetPage();
  clearImagesCard();
  handlingHits();
}

function appendImagesCard(hits) {
  refs.imageCard.insertAdjacentHTML('beforeend', hitsTpl(hits));
  lightbox.refresh();
}

function clearImagesCard() {
  refs.imageCard.innerHTML = '';
}

function smoothScrolling() {
  const { height: cardHeight } = refs.imageCard.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
