import type { GetMovieWatchProvidersResult, MovieWatchProviders as MovieWatchProvidersData } from "@/lib/tmdb/watchProviders";
import { hasWatchProviders } from "@/lib/tmdb/watchProviders";

type MovieWatchProvidersProps = {
  movieTitle: string;
  result: GetMovieWatchProvidersResult;
};

const groups: { key: keyof Pick<MovieWatchProvidersData, "stream" | "rent" | "buy" | "free" | "ads">; label: string }[] = [
  { key: "stream", label: "Stream" },
  { key: "rent", label: "Rent" },
  { key: "buy", label: "Buy" },
  { key: "free", label: "Free" },
  { key: "ads", label: "Ads" },
];

export function MovieWatchProviders({ movieTitle, result }: MovieWatchProvidersProps) {
  if (!result.ok) {
    return (
      <section className="grid gap-2 rounded-card border border-border-subtle surface-strong p-4" aria-label="Where to watch">
        <p className="metadata-label text-accent">Where to watch</p>
        <p className="text-body-sm text-text-secondary">Watch options are not available right now.</p>
      </section>
    );
  }

  const data = result.data;

  if (!hasWatchProviders(data)) {
    return (
      <section className="grid gap-2 rounded-card border border-border-subtle surface-strong p-4" aria-label="Where to watch">
        <p className="metadata-label text-accent">Where to watch</p>
        <p className="text-body-sm text-text-secondary">No watch options found for your region.</p>
        <p className="text-caption text-text-muted">Availability can change between services.</p>
      </section>
    );
  }

  return (
    <section className="grid gap-3 rounded-card border border-border-subtle surface-strong p-4" aria-label="Where to watch">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="metadata-label text-accent">Where to watch</p>
          <p className="text-caption font-semibold uppercase tracking-[0.06em] text-text-muted">{data.region}</p>
        </div>
        {data.link ? (
          <a
            aria-label={`View all watch options for ${movieTitle}`}
            className="text-caption font-bold uppercase tracking-[0.06em] text-accent"
            href={data.link}
            rel="noopener noreferrer"
            target="_blank"
          >
            View all watch options
          </a>
        ) : null}
      </div>

      <div className="grid gap-3">
        {groups.map((group) => {
          const providers = data[group.key];

          if (providers.length === 0) {
            return null;
          }

          return (
            <div className="grid gap-2" key={group.key}>
              <h3 className="text-caption font-bold uppercase tracking-[0.06em] text-text-primary">{group.label}</h3>
              <div className="flex flex-wrap gap-2">
                {providers.map((provider) => (
                  <span
                    aria-label={provider.name}
                    className="inline-flex min-h-9 max-w-full items-center gap-2 rounded-full border border-border-subtle bg-surface/65 px-3 text-body-sm font-semibold text-text-primary"
                    key={provider.providerId}
                    title={provider.name}
                  >
                    {provider.logoUrl ? (
                      <img
                        alt=""
                        aria-hidden="true"
                        className="size-5 shrink-0 rounded-sm object-contain"
                        loading="lazy"
                        src={provider.logoUrl}
                      />
                    ) : null}
                    <span className="truncate">{provider.name}</span>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
