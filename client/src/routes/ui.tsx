import { cn } from "@/ui/lib/utils";
import { Atom, useAtom } from "@effect-atom/atom-react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/ui")({
  component: RouteComponent,
});

const sidebarExpandedAtom = Atom.make(false);

const nav = [
  {
    id: "rankings-1v1",
    title: "1v1 Rankings",
    icon: (
      <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className="h-8"
      >
        <path
          d="M16 12.5C17.933 12.5 19.5 14.067 19.5 16C19.5 17.933 17.933 19.5 16 19.5H8C6.067 19.5 4.5 17.933 4.5 16C4.5 14.067 6.067 12.5 8 12.5H16Z"
          className="fill-text stroke-bg-root"
        />
        <rect
          x="7.5"
          y="3.5"
          width="9"
          height="9"
          rx="4.5"
          className="fill-text stroke-bg-root"
        />
        <path
          d="M15.8284 15.9654C16.6095 15.1844 17.8758 15.1844 18.6569 15.9654L21.1317 18.4403C21.7175 19.0261 21.7175 19.9759 21.1317 20.5616C20.5459 21.1474 19.5962 21.1474 19.0104 20.5616L17.2426 18.7939L15.4749 20.5616C14.8891 21.1474 13.9393 21.1474 13.3536 20.5616C12.7678 19.9759 12.7678 19.0261 13.3536 18.4403L15.8284 15.9654Z"
          className="fill-text stroke-bg-root"
        />
        <path
          d="M15.8284 11.7233C16.6095 10.9422 17.8758 10.9422 18.6569 11.7233L21.1317 14.1981C21.7175 14.7839 21.7175 15.7337 21.1317 16.3194C20.5459 16.9052 19.5962 16.9052 19.0104 16.3194L17.2426 14.5517L15.4749 16.3194C14.8891 16.9052 13.9393 16.9052 13.3536 16.3194C12.7678 15.7337 12.7678 14.7839 13.3536 14.1981L15.8284 11.7233Z"
          className="fill-text stroke-bg-root"
        />
      </svg>
    ),
    href: "/rankings/1v1",
  },
  {
    id: "rankings-2v2",
    title: "2v2 Rankings",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-8"
      >
        <path
          d="M13.5 13.5C15.433 13.5 17 15.067 17 17C17 18.933 15.433 20.5 13.5 20.5H5.5C3.567 20.5 2 18.933 2 17C2 15.067 3.567 13.5 5.5 13.5H13.5Z"
          className="fill-text stroke-bg-root"
        />
        <rect
          x="5"
          y="4.5"
          width="9"
          height="9"
          rx="4.5"
          className="fill-text stroke-bg-root"
        />
        <path
          d="M18.5 13.5C20.433 13.5 22 15.067 22 17C22 18.933 20.433 20.5 18.5 20.5H10.5C8.567 20.5 7 18.933 7 17C7 15.067 8.567 13.5 10.5 13.5H18.5Z"
          className="fill-text stroke-bg-root"
        />
        <rect
          x="10"
          y="4.5"
          width="9"
          height="9"
          rx="4.5"
          className="fill-text stroke-bg-root"
        />
        <path
          d="M15.8284 16.9615C16.6095 16.1805 17.8758 16.1805 18.6569 16.9615L21.1317 19.4364C21.7175 20.0222 21.7175 20.9719 21.1317 21.5577C20.5459 22.1435 19.5962 22.1435 19.0104 21.5577L17.2426 19.79L15.4749 21.5577C14.8891 22.1435 13.9393 22.1435 13.3536 21.5577C12.7678 20.9719 12.7678 20.0222 13.3536 19.4364L15.8284 16.9615Z"
          className="fill-text stroke-bg-root"
        />
        <path
          d="M15.8284 12.7193C16.6095 11.9383 17.8758 11.9383 18.6569 12.7193L21.1317 15.1942C21.7175 15.78 21.7175 16.7298 21.1317 17.3155C20.5459 17.9013 19.5962 17.9013 19.0104 17.3155L17.2426 15.5478L15.4749 17.3155C14.8891 17.9013 13.9393 17.9013 13.3536 17.3155C12.7678 16.7298 12.7678 15.78 13.3536 15.1942L15.8284 12.7193Z"
          className="fill-text stroke-bg-root"
        />
      </svg>
    ),
    href: "/rankings/2v2",
  },
  {
    id: "power-rankings",
    title: "Power Rankings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-8">
        <path
          d="M16 12.5C17.933 12.5 19.5 14.067 19.5 16C19.5 17.933 17.933 19.5 16 19.5H8C6.067 19.5 4.5 17.933 4.5 16C4.5 14.067 6.067 12.5 8 12.5H16Z"
          className="fill-text stroke-bg-root"
        />
        <rect
          x="7.5"
          y="3.5"
          width="9"
          height="9"
          rx="4.5"
          className="fill-text stroke-bg-root"
        />
        <rect
          x="9.5"
          y="15.5"
          width="5"
          height="5"
          rx="2.5"
          className="fill-bg-root stroke-text"
        />
        <path d="M7 13L12 18L17 13" className="stroke-bg-root" />
        <rect
          x="11.5"
          y="17"
          width="1"
          height="2"
          rx="0.5"
          className="fill-text"
        />
      </svg>
    ),
    href: "/rankings/power",
  },
];

function RouteComponent() {
  const [sidebarExpanded, setSidebarExpanded] = useAtom(sidebarExpandedAtom);

  return (
    <div
      style={
        {
          "--sidebar-expanded-width": "16rem",
          "--sidebar-minimized-width": "4rem",
          "--sidebar-width": sidebarExpanded
            ? "var(--sidebar-expanded-width)"
            : "var(--sidebar-minimized-width)",
          "--header-height": "3rem",
          gridTemplateAreas: '"sidebar header" "sidebar main"',
          gridTemplateColumns: "var(--sidebar-width) 1fr",
          gridTemplateRows: "var(--header-height) 1fr",
        } as React.CSSProperties
      }
      className="grid grid-cols-2 h-full transition-all"
    >
      <aside className="[grid-area:sidebar]">
        <div className="h-(--header-height) py-3">
          <img
            src={
              sidebarExpanded
                ? "/assets/images/brand/logos/logo-text.png"
                : "/assets/images/brand/logos/logo-192x192.png"
            }
            alt="Silkpost"
            className="w-full h-full object-contain transition-all"
          />
        </div>
        <ul
          className={cn("flex flex-col gap-2", {
            "p-4": sidebarExpanded,
            "p-2": !sidebarExpanded,
          })}
        >
          {nav.map((item) => (
            <li key={item.id}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center w-full h-8 px-1 border border-transparent",
                  "relative group cursor-pointer rounded-lg",
                  "hover:bg-linear-to-b hover:from-primary-light hover:to-primary-dark hover:border-primary hover:border-t-primary-light",
                  "active:bg-linear-to-t active:border-primary-dark active:border-b-primary-dark",
                  "after:content-[''] after:absolute after:inset-0 after:border-primary-light/25 after:opacity-0 hover:after:opacity-100 hover:after:-inset-1.5 after:transition-all after:rounded-xl"
                )}
              >
                {item.icon}
                <span
                  className={cn(
                    "text-sm font-medium transition-all whitespace-nowrap",
                    {
                      "w-0 opacity-0 -translate-x-3 ml-0": !sidebarExpanded,
                      "w-auto opacity-100 translate-x-0 ml-2": sidebarExpanded,
                    }
                  )}
                >
                  {item.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      <header className="[grid-area:header] flex items-center gap-4">
        <button
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className={cn(
            "relative group cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg",
            "hover:bg-linear-to-b hover:from-primary-light hover:to-primary-dark hover:border hover:border-primary hover:border-t-primary-light",
            "active:bg-linear-to-t active:border-primary-dark active:border-b-primary-dark",
            "after:content-[''] after:absolute after:inset-0 after:border after:border-primary-light/20 after:opacity-0 hover:after:opacity-100 hover:after:-inset-1.5 after:transition-all after:rounded-xl"
          )}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="5"
              y="5"
              height="14"
              rx="1.5"
              fill="currentcolor"
              className={cn("transition-all duration-100", {
                "w-[7.5px] group-hover:w-[3px]": sidebarExpanded,
                "w-[3px] group-hover:w-[7.5px]": !sidebarExpanded,
              })}
            />
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="3"
              stroke="currentcolor"
              strokeWidth={2}
            />
          </svg>
        </button>
      </header>
      <div className="[grid-area:main] pr-1 pb-1 rounded-tl-2xl">
        <div className="rounded-xl p-4 h-full bg-bg-dark border border-border">
          <div className="rounded-lg p-4 bg-bg flex flex-col gap-4 shadow-lg">
            <div>
              <div className="flex items-center gap-4">
                <img
                  src="/assets/images/brand/logos/logo-256x256.png"
                  alt="Silkpost"
                  className="w-12 h-12 rounded-lg border border-border"
                />
                <div className="flex flex-col">
                  <h1 className="text-2xl font-semibold">Silkpost</h1>
                  <span className="text-xs text-primary-light">#4281946</span>
                </div>
              </div>
              <div className="flex gap-x-1 gap-y-2 mt-4 flex-wrap">
                {/* badges */}
                {[
                  "Arona",
                  "passo bem solto",
                  "l'électrissien..",
                  "Sigma Boy Oupi Goupi",
                ].map((alias) => (
                  <span
                    key={alias}
                    className="text-xs text-text-muted bg-bg-light rounded-full px-2 py-0.5 border border-border hover:bg-bg-light/60"
                  >
                    {alias}
                  </span>
                ))}
              </div>
            </div>
            <hr className="border-border" />
            <p className="text-sm text-text-muted">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                className={cn(
                  "relative rounded-lg px-4 py-1 cursor-pointer shadow-sm",
                  "bg-linear-to-b from-primary to-primary-dark border border-primary border-t-primary-light text-primary-foreground",
                  "hover:from-primary-light",
                  "active:from-primary-dark active:to-primary active:border-primary-dark active:border-b-primary-dark",
                  "after:content-[''] after:absolute after:inset-0 after:border after:border-primary-light/25 after:opacity-0 hover:after:opacity-100 hover:after:-inset-1.5 after:transition-all after:rounded-xl"
                )}
              >
                Primary
              </button>
              <button
                className={cn(
                  "relative rounded-lg px-4 py-1 cursor-pointer shadow-sm",
                  "bg-linear-to-b from-secondary to-secondary-dark border border-secondary border-t-secondary-light text-secondary-foreground",
                  "hover:from-secondary-light",
                  "active:from-secondary-dark active:to-secondary active:border-secondary-dark active:border-b-secondary-dark",
                  "after:content-[''] after:absolute after:inset-0 after:border after:border-secondary-light/25 after:opacity-0 hover:after:opacity-100 hover:after:-inset-1.5 after:transition-all after:rounded-xl"
                )}
              >
                Secondary
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
