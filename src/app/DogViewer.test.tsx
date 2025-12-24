import { render, screen, waitFor } from "@testing-library/react";
import DogViewer from "./DogViewer";

function mockFetch(responses: Array<{ ok?: boolean; json: any }>) {
  const queue = [...responses];

  globalThis.fetch = vi.fn(async () => {
    const next = queue.shift();
    if (!next) throw new Error("No more mocked fetch responses");

    const ok = next.ok ?? true;
    return {
      ok,
      json: async () => next.json,
    } as any;
  }) as any;
}

describe("DogViewer", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("Shows initial loading message", () => {
    render(<DogViewer />);
    expect(screen.getByText(/Loading dogs, hang tight.../i)).toBeInTheDocument();
  });

  it("Renders the main dog and the ten thumbnails after successful fetches", async () => {
    // mock list of "all" breeds
    mockFetch([
      {
        ok: true,
        json: {
          message: {
            airedale: [],
            akita: [],
            appenzeller: [],
            boxer: [],
            german: [
              "shepherd"
            ],
            malinois: [],
            newfoundland: [],
            pug: [],
            schnauzer: [
              "giant",
              "miniature"
            ],
            shiba: [],
            weimaraner: []
          }
        }
      },
      // the images from our "randomly generated" breeds list
      ...Array.from({ length: 11 }, (_, i) => ({
        json: { message: `https://images.dog.ceo/breeds/dog-${i}.jpg` },
      }))
    ]);

    render(<DogViewer />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Dog Viewer/i })).toBeInTheDocument();
    });

    // There are 11 images total
    const images = await screen.findAllByRole("img");
    expect(images).toHaveLength(11);

    // There are 11 captions/breeds total
    const captions = document.querySelectorAll("figcaption");
    expect(captions.length).toBe(11);

    // Fetch was called 12 times, one for the list and the rest for the images
    expect(globalThis.fetch).toHaveBeenCalledTimes(12);
  });

  it("Shows error message if breed list fetch fails", async () => {
    mockFetch([
      { ok: false, json: {} },
    ]);

    render(<DogViewer />);

    const message = await screen.findByText(/Couldn\'t fetch the list of breeds/i);
    expect(message).toBeInTheDocument();
  });

  it("Shows error message if you provide a wrong list of breeds when fetching a random dog", async () => {
    mockFetch([
      { ok: true, json: { message: {} } },
    ]);

    render(<DogViewer />);

    const message = await screen.findByText(/Something went wrong with the list you provided/i);
    expect(message).toBeInTheDocument();
  });

  it("Shows error message if something goes wrong when fetching the image", async () => {
    mockFetch([
      { 
        ok: true, 
        json: {
          message: {
            airedale: [],
            akita: [],
            appenzeller: [],
            boxer: [],
            german: [
              "shepherd"
            ],
            malinois: [],
            newfoundland: [],
            pug: [],
            schnauzer: [
              "giant",
              "miniature"
            ],
            shiba: [],
            weimaraner: []
          }
        } 
      },
      {
        ok: false, json: { message: {} },
      }
    ]);

    render(<DogViewer />);

    const message = await screen.findByText(/Couldn\'t fetch the random image for your breed/i);
    expect(message).toBeInTheDocument();
  });

  it("Shows error message if some other error manages to happen", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.reject("network exploded")
    ) as any;

    render(<DogViewer />);

    const message = await screen.findByText(/We couldn\'t find any dogs/i);
    expect(message).toBeInTheDocument();
  });
});
