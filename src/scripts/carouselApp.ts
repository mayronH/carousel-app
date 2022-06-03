interface ImageObjectInterface {
    url: string
    alt: string
}

interface SlideInterface {
    slide: HTMLDivElement
    slideIndex: number
    slideSize: number
    progressPercentage: number
    isMoving: Boolean

    initializeImages(): void
    duplicateImageInSlide(images: Array<Image>): Array<Image>
    processImages(item: Image): string
    fetchImages(url: string): void
    moveSlides(): void
    moveHandler(direction: string): void
    addEventListeners(): void
    calculateSlideSizeAndPercentage(array: Array<Image>): void
}

const root = document.querySelector(":root") as HTMLElement

class Image implements ImageObjectInterface {
    url: string
    alt: string

    constructor(url: string, alt: string) {
        this.url = url
        this.alt = alt
    }
}

// Slide class initialize with any image inside it, if no image present than fetch images from an api
export default class Slide implements SlideInterface {
    slide: HTMLDivElement
    slideIndex: number
    slideSize: number
    progressPercentage: number
    isMoving: Boolean

    constructor(slide: HTMLDivElement) {
        this.slide = slide
        this.slideIndex = 1
        this.slideSize = 0
        this.progressPercentage = 0
        this.isMoving = false

        this.initializeImages()
        this.addEventListeners()
    }

    initializeImages() {
        const slideList = this.slide.querySelectorAll("img") as NodeListOf<HTMLImageElement>
        const slideArray = Array.from(slideList) as Array<HTMLImageElement>
        let slideImages: Array<Image> = []

        slideArray.forEach((img) => {
            slideImages.push(new Image(img.src, img.alt))
        })

        slideImages = this.duplicateImageInSlide(slideImages)
        this.calculateSlideSizeAndPercentage(slideImages)
    }

    // create the images on the page
    processImages(item: Image) {
        return `<img src="${item.url}" alt="${item.alt}"/>`
    }

    duplicateImageInSlide(images: Array<Image>) {
        // copy the first image to the end of the array
        images.push(images[0])
        // copy the last image(the true last image) to the first position
        images.unshift(images[images.length - 2])

        this.slide.innerHTML = images.map(this.processImages).join("")
        this.moveSlides()

        console.log(images)

        return images
    }

    // fetch images from json
    async fetchImages(url: string) {
        await fetch(url)
            .then((res: Response) => {
                if (!res.ok) {
                    throw new Error("Error to fetch the images")
                }
                return res.json()
            })
            .then((data: Array<Image>) => {
                data = this.duplicateImageInSlide(data)
                this.calculateSlideSizeAndPercentage(data)
            })
            .catch((error: Error) => {
                console.log(error)
            })
    }

    calculateSlideSizeAndPercentage(array: Array<Image>) {
        // we have 2 copies of extra image so -2 but to have the last image represent 100% and the first one 0% we subtracted 1 more of the total
        // 4 images  = 25% each, the index 4 means 100% but the index 1 means 25%
        // subtracting - 1 in the setProperty the index 1 means 0% but the 4 means 75%
        // with 33.33% each, the 1 means 0 and the 4 means 100%
        this.progressPercentage = 100 / (array.length - 3)

        this.slideSize = array.length - 1
    }

    moveSlides() {
        // slide the images with translateX
        // each image occupies 100% of the slide div, so each translateX move the image of the div, and because the overflow is hidden, the image disappears
        this.slide.style.transform = `translateX(-${100 * this.slideIndex}%)`

        root.style.setProperty("--slide-progress", `${this.progressPercentage * (this.slideIndex - 1)}% `)
    }

    moveHandler(direction: string) {
        this.isMoving = true
        this.slide.style.transition = "transform 450ms ease-in-out"

        direction !== "right" ? (this.slideIndex = this.slideIndex - 1) : (this.slideIndex = this.slideIndex + 1)

        this.moveSlides()
    }

    addEventListeners() {
        const btn_left = document.querySelector(".slider-btn-left") as HTMLButtonElement
        const btn_right = document.querySelector(".slider-btn-right") as HTMLButtonElement

        btn_right.addEventListener("click", () => {
            if (this.isMoving) {
                return
            }
            this.moveHandler("right")
        })

        btn_left.addEventListener("click", () => {
            if (this.isMoving) {
                return
            }
            this.moveHandler("left")
        })

        this.slide.addEventListener("transitionend", () => {
            this.isMoving = false

            // when we are at the end of the array of images the transition is none
            // otherwise we have the normal transition
            root.style.setProperty(
                "--slide-progress--transition",
                `${this.slideIndex === this.slideSize ? "none" : "all 200ms cubic-bezier(0.82, 0.02, 0.39, 1.01)"} `
            )

            // when we cycle to the end or beginning of the slide we reset the Index
            // but if we let the transition go normally, the slide will jump and pass trough all the images, looking kinda strange to the viewer, so if we remove the transition animation, the images just snap into place
            if (this.slideIndex === 0) {
                this.slide.style.transition = "none"
                // the last one not duplicated
                this.slideIndex = this.slideSize - 1
                this.moveSlides()
            }
            if (this.slideIndex === this.slideSize) {
                this.slide.style.transition = "none"
                this.slideIndex = 1
                this.moveSlides()
            }
        })

        window.addEventListener("keyup", (e: KeyboardEvent) => {
            if (!this.isMoving) {
                switch (e.key) {
                    case "ArrowLeft":
                        this.moveHandler("left")
                        break

                    case "ArrowRight":
                        this.moveHandler("right")
                        break
                    default:
                        break
                }
            }
        })
    }
}

// export default function initSliderApp() {
//     const slides = document.querySelectorAll(".slide") as NodeListOf<HTMLDivElement>

//     slides?.forEach((slide) => {
//         if (slide != null) {
//             new Slide(slide)
//         }
//     })
// }
