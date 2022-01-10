import hitsTpl from './templates/hits.hbs';
import ImagesApiService from './js/img-service';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

//===== Инициализация SimpleLightbox =====
let lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

const refs = {
  form: document.querySelector('#search-form'),
  loadMoreBtn: document.querySelector('.load-more'),
  imageCard: document.querySelector('.gallery'),
  textInput: document.querySelector('input'),
};
const imagesApiService = new ImagesApiService();

refs.form.addEventListener('submit', onSearchForm);
refs.loadMoreBtn.addEventListener('click', fetchHits);
refs.loadMoreBtn.classList.add('is-hidden');

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
    onClearImagesCard();
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
      if (totalHits === 0) {
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
      onAppendImagesCard(hits);
      Notiflix.Notify.info(`Hooray! We found ${totalHits} images.`);
      refs.loadMoreBtn.classList.remove('is-hidden');
    });
  } catch (error) {
    Notiflix.Notify.warning('Sorry, there is a problem. Try later.');
    console.log(error.stack);
  }
}

function onAppendImagesCard(hits) {
  refs.imageCard.insertAdjacentHTML('beforeend', hitsTpl(hits));

  //  Плавная прокрутка при отрисовке следующей группы изображений
  const { height: cardHeight } = refs.imageCard.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function onClearImagesCard() {
  refs.imageCard.innerHTML = '';
}
