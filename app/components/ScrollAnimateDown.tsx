import { getSlideDownScrollVariants } from "../lib/scroll-variants";
import { ScrollAnimation } from "./ScrollAnimation";

interface Props {
  delay: number;
  children: React.ReactNode;
}

export function ScrollAnimateDown (props: Props) {
  const { delay, children } = props;
  return (
    <ScrollAnimation variants={getSlideDownScrollVariants({ delay })}>
      {children}
    </ScrollAnimation>
  )
}