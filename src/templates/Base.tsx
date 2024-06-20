import { Meta } from '../layout/Meta';
import { AppConfig } from '../utils/AppConfig';
// import { Banner } from './Banner';
// import { Footer } from './Footer';
// import { Hero } from './Hero';
// import { Sponsors } from './Sponsors';
// import { VerticalFeatures } from './VerticalFeatures';
import MonkeyMath from './MonkeyMath';
import DrawerBasic from '../layout/NavBar';

import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

const Base = () => (
  <div className="text-gray-600 antialiased">
    <Meta title={AppConfig.title} description={AppConfig.description} />
    <DrawerBasic />
    <MonkeyMath />
  </div>
);

export { Base };

//     <Hero />
//     <Sponsors />
//     <VerticalFeatures />
//     <Banner />
//     <Footer />
