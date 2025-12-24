import { useState, useEffect, useRef } from 'react'
import './DogViewer.css'

type Dog = {
  breed: string,
  image: string
};

const fetchBreeds = async (): Promise<string[]> => {
  const response = await fetch('https://dog.ceo/api/breeds/list/all')
  if (!response.ok) throw new Error("Couldn't fetch the list of breeds");
  const data = await response.json();
  return Object.keys(data.message);
}

const fetchRandomDog = async (breedsList: string[]): Promise<Dog> => {
  if (breedsList.length === 0) throw new Error("Something went wrong with the list you provided");
  const randomBreedIndex = Math.floor(Math.random() * breedsList.length);
  const breedName = breedsList[randomBreedIndex];

  const randomBreedImage = await fetch(`https://dog.ceo/api/breed/${breedName}/images/random`);
  if (!randomBreedImage.ok) throw new Error("Couldn't fetch the random image for your breed");
  const data = await randomBreedImage.json();

  return { breed: breedName, image: data.message };
}

const DogViewer = () => {
  const [mainDog, setMainDog] = useState<Dog>({
    breed: "",
    image: ""
  });
  const [thumbnailDogs, setThumbnailDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>("Loading dogs, hang tight...");
  const hasFetched = useRef<boolean>(false);
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    (async () => {
      try {
        const allBreeds = await fetchBreeds();

        const promises = [fetchRandomDog(allBreeds), ...Array.from({ length: 10 }, () => fetchRandomDog(allBreeds))];
        const dogs = await Promise.all(promises);

        const newMainDog: Dog = dogs[0];
        const thumbDogs: Dog[] = dogs.slice(1);

        setMainDog(newMainDog);
        setThumbnailDogs([...thumbDogs]);
        setMessage("OK");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "We couldn't find any dogs ):";
        setMessage(errorMessage);
      } finally {
        setLoading(false);
      }

    })();

  }, []);

  return (
    <>
      <h1>Dog Viewer</h1>
      {loading || message !== "OK" ? (
        <p>{message}</p>
      )
        :
        (
          <>
            <figure className="main-dog">
              <img className="main-dog__img" src={mainDog.image} alt={mainDog.breed} />
              <figcaption className="main-dog__name">{mainDog.breed}</figcaption>
            </figure>
            <div className="other-dogs">
              {thumbnailDogs.map((dog, index) => (
                <figure className="dog-card" key={`dog-${index}`}>
                  <img className="dog-card__img" src={dog.image} alt={dog.breed} onClick={() => setMainDog({ breed: dog.breed, image: dog.image })} />
                  <figcaption className="dog-card__name">{dog.breed}</figcaption>
                </figure>
              ))}
            </div>
          </>
        )
      }
    </>
  )
}

export default DogViewer;