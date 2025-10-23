export default function Spinner({ size = 100, message = "Loading..." }) {
  return (
    <div className="ae:flex ae:flex-col ae:items-center ae:justify-center">
      <svg
        className="ae:animate-spin ae:origin-center"
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 390 390"
      >
        <g className="ae:origin-center">
          <path
            fill="#0096DE"
            d="M232 222c-8 11-11 18-14 32h56v-23l63 39-63 36v-23h-56c3 14 5 20 14 31s14 15 24 22c10 6 16 8 27 10 16 1 25 0 40-5 13-6 20-10 29-21 10-9 11-14 17-27 3-9 4-14 3-23 1-10-1-15-3-25-5-12-9-19-17-29-9-9-16-14-29-20-15-5-23-6-40-4-14 3-20 5-27 9-10 6-15 11-24 21Z"
          />
          <path
            fill="#30B808"
            d="M178 238c-6-12-11-19-21-28l-28 48 20 11-65 36v-73l20 11 27-48c-13-4-20-5-34-3-13 2-19 4-30 10-10 6-15 9-22 18-9 14-13 22-16 37-1 15-1 22 3 36 4 13 7 17 16 28 6 7 10 10 18 15s14 6 23 9c13 2 21 2 34 0 13-3 20-7 32-15 11-11 16-18 23-33 5-14 6-20 6-28 0-12-2-18-6-31Z"
          />
          <path
            fill="#FF7D17"
            d="M191 183c14 2 21 1 35-3l-28-48-20 11 2-74 63 37-20 11 28 48c10-9 15-15 20-28 5-12 6-19 7-31 0-12-1-18-5-28-7-15-12-23-24-33-12-8-19-12-33-15-12-3-18-2-31 0-10 1-15 3-23 8s-12 9-19 15v1c-9 10-12 16-17 28-3 13-4 21-3 36 4 15 7 23 17 37 10 10 14 14 21 18 10 6 17 8 30 10Z"
          />
        </g>
      </svg>
      <span className="ae:text-base ae:md:text-lg ae:text-gray-500 ae:animate-pulse">
        {message}
      </span>
    </div>
  );
}
