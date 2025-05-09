"use client"

import { LayoutGroup, motion } from "motion/react"
import { TextRotate } from "@/components/ui/text-rotate"

export default function HeroText() {
  return (
    <div className="w-full h-full text-2xl sm:text-3xl md:text-5xl flex flex-row items-center justify-center font-overusedGrotesk bg-background text-foreground font-light overflow-hidden p-12 sm:p-14 md:p-14">
      <LayoutGroup>
        <motion.p className="flex whitespace-pre" layout>
          <motion.span
            className="pt-0.5 sm:pt-1 md:pt-2"
            layout
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
          >
            Discover{" "}
          </motion.span>
          <TextRotate
            texts={[
              "Powerful",
              "Creative",
              "Interesting",
              "Reliable",
              "Innovative",
            ]}
            mainClassName="text-primary-foreground px-2 sm:px-2 md:px-3 bg-primary overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
            staggerFrom={"last"}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            staggerDuration={0.025}
            splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            rotationInterval={2000}
          />
          <motion.span
            className="pt-0.5 sm:pt-1 md:pt-2"
            layout
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
          >
            {" "}MCP Servers
          </motion.span>
        </motion.p>
      </LayoutGroup>
    </div>
  )
}