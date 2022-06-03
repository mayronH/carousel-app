import "./css/main.css"

import Slide from "./scripts/carouselApp"

const slideElement = document.querySelector(".slide") as HTMLDivElement
const slide = new Slide(slideElement)

slide.fetchImages("images.json")
