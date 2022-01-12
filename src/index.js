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

refs.form.addEventListener('submit', onSearchForm);
loadMoreBtn.refs.button.addEventListener('click', fetchHits);
loadMoreBtn.hide();

//===== SimpleLightbox =====
let lightbox = new SimpleLightbox('.gallery a');

async function onSearchForm(e) {
  try {
    e.preventDefault();

    imagesApiService.searchQuery = e.currentTarget.elements.searchQuery.value;
    if (imagesApiService.searchQuery.trim() === '') {
      return Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again',
      );
    }

    imagesApiService.resetPage();
    clearImagesCard();
    await fetchHits();
  } catch (error) {
    Notiflix.Notify.warning('Sorry, there is a problem. Try later.');
    console.log('Error', error.message);
  }
}

async function fetchHits() {
  try {
    await imagesApiService.fetchImages().then(({ data, config }) => {
      //  Если бэкэнд ничего не вернул
      if (data.hits.length === 0) {
        return Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again',
        );
      }

      //  Выводим сообщение о кол-ве найденных изображений
      if (config.params.page === 1) {
        Notiflix.Notify.info(`Hooray! We found ${data.totalHits} images.`);
      }

      //  Рэндэрим  полученные изображения
      appendImagesCard(data.hits);

      if (config.params.page > 1) {
        smoothScrolling();
      }

      loadMoreBtn.show();

      //  Если вывели все изображения, полученные от бэкэнда
      const sumUploadedImages = config.params.per_page * config.params.page;

      if (sumUploadedImages > data.totalHits) {
        loadMoreBtn.hide();
        refs.textInput.value = '';

        return Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
      }
    });
  } catch (error) {
    Notiflix.Notify.warning('Sorry, there is a problem. Try later.');
    console.log('Error', error.message);
  }
}

function appendImagesCard(hits) {
  refs.imageCard.insertAdjacentHTML('beforeend', hitsTpl(hits));
  lightbox.refresh();
}

function clearImagesCard() {
  refs.imageCard.innerHTML = '';
}

function smoothScrolling(params) {
  const { height: cardHeight } = refs.imageCard.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

//==================================================================

// console.log(loadMoreBtn.refs.button);

// function enableIntersectionObserver() {
//   const options = {
//     root: loadMoreBtn.refs.button,
//     threshold: 1,
//   };
//   const handleObserver = ([item]) => {
//     if (item.isIntersecting && !isLoading && currentPage < maxPage) {
//       loadMore();
//     }
//   };
//   const observer = new IntersectionObserver(handleObserver, options);

//   observer.observe(refs.loadMore);
// }
