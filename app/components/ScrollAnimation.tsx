import type { Variants } from "framer-motion";
import { motion } from "framer-motion";

interface Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  variants: Variants
  children: React.ReactNode
}

export function ScrollAnimation (props: Props) {
  const { variants, children } = props;
  return (
    <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true }} variants={variants}>
      {children}
    </motion.div>
  )
}