import axios from 'axios';

const API_KEY = '25087335-3cdefc00f91a8164449ce63a1';

axios.defaults.baseURL = 'https://pixabay.com/api/';

export default class ImagesApiService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
  }

  async fetchImages() {
    const params = {
      key: API_KEY,
      q: this.searchForm,
      per_page: 40,
      page: this.page,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
    };

    this.incrementPage();
    const response = await axios({ params });
    return response.data;
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }

  get searchQuery() {
    return this.searchForm;
  }

  set searchQuery(newQuery) {
    this.searchForm = newQuery;
  }
}
