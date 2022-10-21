import { getSlideUpScrollVariants } from "../lib/scroll-variants";
import { ScrollAnimation } from "./ScrollAnimation";

interface Props {
  delay: number;
  children: React.ReactNode;
}

export function ScrollAnimateUp (props: Props) {
  const { delay, children } = props;
  return (
    <ScrollAnimation variants={getSlideUpScrollVariants({ delay })}>
      {children}
    </ScrollAnimation>
  )
}