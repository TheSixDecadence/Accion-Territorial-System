"use client";

import { useEffect, useState } from "react";
import { authenticatedApiFetch } from "@/app/Libs/apiFetch";
import Field, { controlClass } from "./Field";

export default function AddressSearch({
  error,
  id = "address-search",
  label = "Dirección",
  onChange,
  onSelect,
  value,
}) {
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedAddress, setSelectedAddress] = useState(value);

  useEffect(() => {
    const query = value.trim();

    if (query.length < 3 || query === selectedAddress) return undefined;

    let active = true;
    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError("");

      const response = await authenticatedApiFetch({
        url: `/delivery/address-search/?q=${encodeURIComponent(query)}`,
      });
      if (!active) return;

      if (response?.error) {
        setResults([]);
        setSearchError(
          response.message || "No fue posible buscar la dirección.",
        );
      } else {
        setResults(response.results || []);
      }

      setIsSearching(false);
    }, 400);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [selectedAddress, value]);

  const selectResult = (result) => {
    setSelectedAddress(result.full_address);
    setResults([]);
    onSelect(result);
  };

  return (
    <Field error={error || searchError} htmlFor={id} label={label}>
      <div className="relative">
        <input
          autoComplete="off"
          className={controlClass}
          id={id}
          onChange={(event) => {
            setSelectedAddress("");
            setResults([]);
            setSearchError("");
            setIsSearching(false);
            onChange(event.target.value);
          }}
          type="text"
          value={value}
        />

        {isSearching ? (
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Buscando dirección…
          </p>
        ) : null}

        {results.length > 0 ? (
          <ul className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
            {results.map((result) => (
              <li key={`${result.tomtom_place_id}-${result.latitude}`}>
                <button
                  className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--color-background)]"
                  onClick={() => selectResult(result)}
                  type="button"
                >
                  {result.full_address}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Field>
  );
}
