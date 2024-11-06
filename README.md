 <section className="tab-content">
      <div className="tab-content__section">
        <h1 className="tab-content__heading tab-content__heading--page">
          CityGo Travel Booking app
        </h1>
        <div className="tab-content__overview">
          <p className="tab-content__desc">
            The app addresses the common challenges travelers encounter when
            planning city tours, such as cumbersome booking processes and
            unclear navigation. By providing a streamlined user experience, the
            app ensures secure user management and simplifies the booking
            journey. With CityGo, travelers can easily discover and book their
            ideal city tours, making their travel planning efficient and
            enjoyable.
          </p>

          <div className="tab-content__features">
            <h3 className="tab-content__subheading">Features implemented</h3>
            <ul className="tab-content__features-list">
              {featuresCompleted.map((feature, index) => (
                <li className="tab-content__features-item" key={index}>
                  <img
                    className="tab-content__icon--check"
                    src={checkIcon}
                    alt="Check icon"
                  />
                  <span className="tab-content__features-name">
                    {feature.name}:
                  </span>
                  <span className="tab-content__features-desc">
                    {feature.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <h2 className="tab-content__heading">Demo</h2>
        <div className="tab-content__img">
          <video src={citygoVideo} autoPlay loop muted></video>
        </div>
      </div>

      <div className="tab-content__section">
        <h2 className="tab-content__heading">Outcome</h2>
        <p className="tab-content__desc">
          The CityGo app is live and ready for exploration! Check out the demo
          to see the features in action, and feel free to visit the GitHub
          repository for collaboration or to share your feedback.
        </p>
        <div className="tab-content__icons">
          <a href="https://citygo.liuladniak.io/" target="_blank">
            <img src={iconGithub} className="tab-content__icon" />
            <span className="tab-content__icon-alt">Github repo</span>
          </a>
          <a href="https://github.com/liuladniak/citygo" target="_blank">
            <img src={iconLaptop} className="tab-content__icon" />
            <span className="__icon-alt">View live</span>
          </a>
        </div>
      </div>
      <div className="tab-content__section">
        <h2 className="tab-content__heading">Next steps</h2>
        <p className="tab-content__desc">
          As I continue to enhance the CityGo Travel Booking app, my focus is on
          implementing features that improve user experience. I appreciate your
          feedback as I work towards delivering a seamless booking process and
          expanded functionalities.
        </p>
        <h3 className="tab-content__subheading">Features in progress</h3>
        <ul className="tab-content__features-list">
          {featuresInProgress.map((feature, index) => (
            <li className="tab-content__features-item" key={index}>
              <img
                className="tab-content__icon--next"
                src={clockIcon}
                alt="circle icon"
              />
              <span>{feature.name}</span>
              <span>{feature.description}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
