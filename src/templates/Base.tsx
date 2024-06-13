import { Meta } from '../layout/Meta';
import { AppConfig } from '../utils/AppConfig';
// import { Banner } from './Banner';
// import { Footer } from './Footer';
// import { Hero } from './Hero';
// import { Sponsors } from './Sponsors';
// import { VerticalFeatures } from './VerticalFeatures';
import MonkeyMath from './MonkeyMath';

const Base = () => (
  <div className="text-gray-600 antialiased">
    <Meta title={AppConfig.title} description={AppConfig.description} />
    <MonkeyMath />
  </div>
);

export { Base };

//     <Hero />
//     <Sponsors />
//     <VerticalFeatures />
//     <Banner />
//     <Footer />
