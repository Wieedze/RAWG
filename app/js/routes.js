import Home from './Home.js';
import PageList from './PageList.js'
import PageDetail from './PageDetail.js'


const routes = {
    'home': Home,
    'pagelist': PageList,
    'pagedetail': PageDetail,
};

window.addEventListener('load', () => {
    if (!location.hash) {
        location.hash = '#home';
    }
});

export default routes