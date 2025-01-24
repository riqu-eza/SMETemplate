// src/About.js

import Header from "../components/header";

const About = () => {
  return (
    <>
      <Header />
      <div className="bg-light-brown   text-brown-900">
        <div
          className="relative bg-cover bg-center h-64 flex items-center justify-center"
          style={{
            backgroundImage: `url('/123.avif')`,
          }}
        >
          <h1 className="text-3xl text-center font-bold text-white">
            About LSKIN
          </h1>
        </div>
        <div className="flex  mt-8" style={{ height: "400px" }}>
          <div className="m-1 flex-grow flex items-center">
            <p className="text-lg leading-relaxed m-1 text-center p-2 text-slate-400  mb-0">
              LSKIN, an organic skincare and wellness company, is thrilled to
              present an exciting opportunity to invest in our organic skincare
              journey. With a shared commitment to sustainability and natural
              wellness, we are poised to revolutionize the skincare industry.
            </p>
          </div>

          <div
            className="  m-2 mr-24 flex-shrink-0 flex items-center"
            style={{}}
          >
            <img
              src="/123.avif"
              alt="Organic skincare products"
              className="block mx-auto h-full"
              style={{ width: "auto" }} // Ensure the image takes 80% of the container height
            />
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-6 mt-12  bg-slate-100 shadow-lg rounded-lg border border-slate-300">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">
            Our Mission
          </h2>
          <p className="text-lg leading-relaxed text-slate-700 mb-6">
            Our mission is to deliver high-quality, organic skincare products
            that prioritize the health of both our customers and the planet.
            LSKIN is focused on providing premium skincare, hence our
            community`s key values are based on:
          </p>

          <ul className="list-disc pl-8 text-lg mb-6 text-slate-700 space-y-4">
            <li>
              <span className="font-semibold text-slate-800">
                Ethical sourcing:
              </span>{" "}
              We prioritize responsibly sourced ingredients, such as organic and
              fair-trade materials, to minimize the impact on local communities
              and ecosystems.
            </li>
            <li>
              <span className="font-semibold text-slate-800">
                Clean formulations:
              </span>{" "}
              Avoiding harmful chemicals like parabens, sulfates, and phthalates
              in skincare products.
            </li>
          </ul>

          <p className="text-lg text-right text-slate-700">
            --- Together, we are committed to making a positive impact on the
            beauty industry while caring for our planet.
          </p>
        </div>
        <div className="max-w-6xl mx-auto p-6  ">
          <h2 className="text-2xl italic text-center mb-8 text-slate-900">
            RADIANCE FROM WITHIN
          </h2>

          <p
            className="text-lg leading-relaxed mb-6 text-slate-800 font-semibold"
            style={{ fontFamily: "Dancing Script, cursive" }}
          >
            We believe in promoting beauty that goes beyond the surface,
            focusing on health and sustainability. Join us in embracing a more
            natural, eco-friendly skincare journey!
          </p>

          <img
            src="/homelskin1.jpg"
            alt="Sustainable ingredients in skincare"
            className="block mx-auto w-full max-w-md mb-6"
          />
        </div>
      </div>
    </>
  );
};

export default About;
