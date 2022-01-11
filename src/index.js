import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import ImagesApiService from './js/img-service';
import hitsTpl from './templates/hits.hbs';
import LoadMoreBtn from './js/load-more-btn';
import gallery from './css/gallery.css';
// import InfiniteScroll from 'infinite-scroll';

const imagesApiService = new ImagesApiService();
const loadMoreBtn = new LoadMoreBtn();
const refs = {
  form: document.querySelector('#search-form'),
  imageCard: document.querySelector('.gallery'),
  textInput: document.querySelector('input'),
  // linkImage: document.querySelector('.photo-card__link'),
};

refs.form.addEventListener('submit', onSearchForm);
// refs.linkImage.addEventListener('onclick');
loadMoreBtn.refs.button.addEventListener('click', fetchHits);
loadMoreBtn.hide();

//===== SimpleLightbox =====
let lightbox = new SimpleLightbox('.gallery a');

//=====Infinite Scroll=====
// const infScroll = new InfiniteScroll(elem, {
//   path: '.pagination__next',
//   history: false,
// });

//  Записываем общее кол-во полученных от бэкэнда изображений
let label;
imagesApiService.fetchImages().then(({ totalHits }) => {
  return (label = totalHits);
});

async function onSearchForm(e) {
  try {
    e.preventDefault();

    imagesApiService.searchQuery = e.currentTarget.elements.searchQuery.value;

    if (imagesApiService.searchQuery === '') {
      return Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again',
      );
    }

    imagesApiService.resetPage();
    clearImagesCard();
    await fetchHits();
  } catch (error) {
    Notiflix.Notify.warning('Sorry, there is a problem. Try later.');
    console.log(error.stack);
  }
}

async function fetchHits() {
  try {
    await imagesApiService.fetchImages().then(({ totalHits, hits }) => {
      //  Считаем сколько полученных от бэкэнда изображений осталось вывести
      label -= hits.length;

      //  Если бэкэнд ничего не вернул
      if (hits.length === 0) {
        return Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again',
        );
      }
      //  Если вывели все изображения, полученные от бэкэнда
      if (label <= 0) {
        refs.loadMoreBtn.classList.add('is-hidden');
        refs.textInput.value = '';

        return Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
      }
      //  Рэндэрим  полученные изображения
      Notiflix.Notify.info(`Hooray! We found ${totalHits} images.`);
      appendImagesCard(hits);
      loadMoreBtn.show();
    });
  } catch (error) {
    Notiflix.Notify.warning('Sorry, there is a problem. Try later.');
    console.log(error.stack);
  }
}

function appendImagesCard(hits) {
  refs.imageCard.insertAdjacentHTML('beforeend', hitsTpl(hits));
  lightbox.refresh();

  //  Плавная прокрутка при отрисовке следующей группы изображений
  const { height: cardHeight } = refs.imageCard.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function clearImagesCard() {
  refs.imageCard.innerHTML = '';
}
