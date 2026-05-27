import "./PageLoader.scss";

const PageLoader = ({ message = "Loading...", error = null }) => {
  return (
    <div className="page-loader">
      {error ? (
        <p className="page-loader__error">{error}</p>
      ) : (
        <>
          <div className="page-loader__spinner" />
          <p className="page-loader__message">{message}</p>
        </>
      )}
    </div>
  );
};

export default PageLoader;
