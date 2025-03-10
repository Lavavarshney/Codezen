import { features } from "../constants";
import styles, { layout } from "../style";
import Button from "./Button";
import { motion } from "framer-motion"; // Import Framer Motion

const FeatureCard = ({ icon, title, content, index }) => {
  // Variants for the feature card animation
  const cardVariants = {
    hidden: { opacity: 0, x: -100, rotate: -10 }, // Start off-screen with a slight tilt
    visible: (i) => ({
      opacity: 1,
      x: 0,
      rotate: 0,
      transition: {
        delay: i * 0.2, // Staggered entrance
        duration: 0.7,
        ease: "easeOut",
        type: "spring", // Bouncy effect
      },
    }),
    hover: {
      y: -10, // Lift up on hover
      boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)", // Add shadow
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      className={`flex flex-row p-6 rounded-[20px] ${
        index !== features.length - 1 ? "mb-6" : "mb-0"
      } feature-card`}
      custom={index} // For staggered animation
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
    >
      <div
        className={`w-[64px] h-[64px] rounded-full ${styles.flexCenter} bg-dimBlue`}
      >
        <img src={icon} alt="star" className="w-[50%] h-[50%] object-contain" />
      </div>
      <div className="flex-1 flex flex-col ml-3">
        <h4 className="font-poppins font-semibold text-white text-[18px] leading-[23.4px] mb-1">
          {title}
        </h4>
        <p className="font-poppins font-normal text-dimWhite text-[16px] leading-[24px]">
          {content}
        </p>
      </div>
    </motion.div>
  );
};

const Business = () => {
  // Variants for the section text
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <section id="features" className={layout.section}>
      <motion.div
        className={layout.sectionInfo}
        initial="hidden"
        animate="visible"
        variants={textVariants}
      >
        <h2 className={styles.heading2}>
          You do the business, <br className="sm:block hidden" /> we’ll handle
          the money.
        </h2>
        <p className={`${styles.paragraph} max-w-[470px] mt-5`}>
          With the right credit card, you can improve your financial life by
          building credit, earning rewards and saving money. But with hundreds
          of credit cards on the market.
        </p>

        <Button styles="mt-10" />
      </motion.div>

      <div className={`${layout.sectionImg} flex-col`}>
        {features.map((feature, index) => (
          <FeatureCard key={feature.id} {...feature} index={index} />
        ))}
      </div>
    </section>
  );
};

export default Business;