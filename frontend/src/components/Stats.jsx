import { stats } from "../constants";
import styles from "../style";
import { motion } from "framer-motion";

const Stats = () => {
  // Animation variants for the stat container
  const statVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2, // Staggered delay for each stat
        duration: 0.6,
        ease: "easeOut",
      },
    }),
    hover: {
      scale: 1.05, // Slight scale-up on hover
      transition: { duration: 0.3 },
    },
  };

  return (
    <section
      className={`${styles.flexCenter} flex-row flex-wrap sm:mb-20 mb-6`}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.id}
          className="flex-1 flex justify-start items-center flex-row m-3"
          custom={index}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          variants={statVariants}
        >
          <h4 className="font-poppins font-semibold xs:text-[40.89px] text-[30.89px] xs:leading-[53.16px] leading-[43.16px] text-white">
            {stat.value}
          </h4>
          <p className="font-poppins font-normal xs:text-[20.45px] text-[15.45px] xs:leading-[26.58px] leading-[21.58px] text-gradient uppercase ml-3">
            {stat.title}
          </p>
        </motion.div>
      ))}
    </section>
  );
};

export default Stats;