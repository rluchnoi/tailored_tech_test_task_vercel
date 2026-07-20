"use client";

import { Fragment } from "react";
import { FolderLock } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AcmeLogo } from "./acme-logo";
import { useDataRoom } from "./data-room-provider";

/**
 * Breadcrumb trail from the Data Room root to the current folder. Every segment
 * except the last is a clickable shortcut back up the tree.
 *
 * The root adapts to viewport: on mobile (no sidebar) it shows the Acme logo,
 * which both carries the brand and acts as the "back to root" control while
 * saving horizontal room for the path; on wider screens it shows the labelled
 * "Data Room" since the sidebar already displays the brand. Segments and the
 * chevron separators are enlarged on mobile for comfortable tapping.
 */
export function Breadcrumbs() {
  const { breadcrumb, navigateTo } = useDataRoom();

  const atRoot = breadcrumb.length === 0;

  const rootContent = (
    <>
      <AcmeLogo size="sm" className="md:hidden" />
      <span className="hidden items-center gap-1.5 font-medium md:flex">
        <FolderLock className="size-4" />
        Data Room
      </span>
    </>
  );

  return (
    <Breadcrumb>
      <BreadcrumbList className="flex-nowrap gap-1 sm:gap-1.5">
        <BreadcrumbItem>
          {atRoot ? (
            <BreadcrumbPage className="flex items-center" aria-label="Data Room">
              {rootContent}
            </BreadcrumbPage>
          ) : (
            <BreadcrumbLink
              onClick={() => navigateTo(null)}
              aria-label="Data Room"
              className="flex cursor-pointer items-center rounded-lg"
            >
              {rootContent}
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>

        {breadcrumb.map((folder, i) => {
          const isLast = i === breadcrumb.length - 1;
          return (
            <Fragment key={folder.id}>
              <BreadcrumbSeparator className="text-muted-foreground/70 [&>svg]:size-5 sm:[&>svg]:size-4" />
              <BreadcrumbItem className="min-w-0">
                {isLast ? (
                  <BreadcrumbPage className="truncate py-1 text-base font-medium sm:text-sm">
                    {folder.name}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    onClick={() => navigateTo(folder.id)}
                    className="max-w-[9rem] cursor-pointer truncate rounded-md px-1.5 py-1.5 text-base sm:max-w-[12rem] sm:px-0 sm:py-0 sm:text-sm"
                  >
                    {folder.name}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
