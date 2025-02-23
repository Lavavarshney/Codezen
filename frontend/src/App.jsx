import styles from "./style";
import { Navbar} from "./components";
import {Hero} from "./components";
import {Stats} from "./components";
import { Business } from "./components";
import { Billing } from "./components";
import CardDeal from "./components/cardDeal";
import Testimonials from "./components/testimonials";
import Clients from "./components/clients";
import { CTA } from "./components";
import { Footer } from "./components";

const App = () => (
  <div className="bg-primary w-full overflow-hidden">
    <div className={`${styles.paddingX} ${styles.flexCenter}`}>
      <div className={`${styles.boxWidth}`}>
        <Navbar />
      </div>
    </div>

    <div className={`bg-primary ${styles.flexStart}`}>
      <div className={`${styles.boxWidth}`}>
        < Hero />
      </div>
    </div>
    
    <div className={`bg-primary ${styles.paddingX} ${styles.flexCenter}`}>
      <div className={`${styles.boxWidth}`}>
< Stats />
< Business />
< Billing />
< CardDeal />
<Testimonials />
< Clients />
< CTA />
< Footer />
      </div>
    </div>
  </div>
);

export default App;