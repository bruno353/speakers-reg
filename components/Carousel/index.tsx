'use client'
import { Carousel } from '@mantine/carousel'
import { UserOutlined } from '@ant-design/icons'

function EmblaCarousel() {
  const slides = [
    {
      src: '/images/carousel/blockchainLogo.svg',
      alt: 'Bitcoin Logo',
      text: 'Task title',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
      categories: ['AI', 'BLOCKCHAIN', 'SCIENCE'],
      submitter: '0x1f28763e7579F76620aAB20063534CF3599e2b4c',
    },
    {
      src: '/images/carousel/bitcoinLogo.svg',
      alt: 'Bitcoin Logo',
      text: 'Task title',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
      categories: ['FRONTEND'],
      submitter: '0x1f28763e7579F76620aAB20063534CF3599e2b4c',
    },
    {
      src: '/images/carousel/blockchainLogo.svg',
      alt: 'Bitcoin Logo',
      text: 'Task title',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
      categories: ['BACKEND'],
      submitter: '0x1f28763e7579F76620aAB20063534CF3599e2b4c',
    },
  ]

  function formatAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <>
      {/* <h1 className="text-center">Trending tasks</h1> */}
      <Carousel
        maw={800}
        mx="auto"
        controlsOffset="5xs"
        withIndicators
        height={200}
        styles={{
          control: {
            '&[data-inactive]': {
              opacity: 0,
              cursor: 'default',
            },
            color: 'white',
          },
        }}
        className="mx-4 mt-28 mb-44 items-center lg:mx-auto"
      >
        {slides.map((slide, index) => (
          <Carousel.Slide key={index}>
            <div className="flex">
              <img
                className="ml-10 hidden w-1/2 lg:inline-block"
                src={slide.src}
                alt={slide.alt}
              />
              <div className="ml-8 mr-7 lg:w-1/2">
                <div className="max-h-[180px] overflow-hidden ">
                  <p
                    title={slide.text}
                    className="text-xl font-semibold line-clamp-1 lg:text-2xl"
                  >
                    {slide.text}
                  </p>
                  <div className="mb-2 flex space-x-2">
                    {slide.categories.map((category, index) => (
                      <span
                        key={index}
                        className="mt-4 rounded-full bg-[#071054] px-2 py-1 text-[9px] text-white"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                  <p
                    className="mt-5 overflow-hidden text-xs line-clamp-5 lg:text-base lg:line-clamp-3"
                    title={slide.description}
                  >
                    {slide.description}{' '}
                    {/* 150 é o número máximo de caracteres que você quer exibir */}
                  </p>
                </div>
                <div className="absolute bottom-0 flex ">
                  <UserOutlined />
                  <p className="ml-1 text-xs" title={slide.submitter}>
                    {formatAddress(slide.submitter)}
                  </p>
                </div>
              </div>
            </div>
          </Carousel.Slide>
        ))}
      </Carousel>
    </>
  )
}

export default EmblaCarousel
