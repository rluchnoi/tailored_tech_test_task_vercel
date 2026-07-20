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
import { useDataRoom } from "./data-room-provider";

/**
 * Breadcrumb trail from the Data Room root to the current folder. Every segment
 * except the last is a clickable shortcut back up the tree.
 */
export function Breadcrumbs() {
  const { breadcrumb, navigateTo } = useDataRoom();

  const atRoot = breadcrumb.length === 0;

  return (
    <Breadcrumb>
      <BreadcrumbList className="flex-nowrap">
        <BreadcrumbItem>
          {atRoot ? (
            <BreadcrumbPage className="flex items-center gap-1.5 font-medium">
              <FolderLock className="size-4" />
              Data Room
            </BreadcrumbPage>
          ) : (
            <BreadcrumbLink
              onClick={() => navigateTo(null)}
              className="flex cursor-pointer items-center gap-1.5"
            >
              <FolderLock className="size-4" />
              Data Room
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>

        {breadcrumb.map((folder, i) => {
          const isLast = i === breadcrumb.length - 1;
          return (
            <Fragment key={folder.id}>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="min-w-0">
                {isLast ? (
                  <BreadcrumbPage className="truncate font-medium">
                    {folder.name}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    onClick={() => navigateTo(folder.id)}
                    className="max-w-[12rem] cursor-pointer truncate"
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
