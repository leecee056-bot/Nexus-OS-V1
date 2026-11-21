#pragma once

#include <stddef.h>
#include <stdbool.h>

#define VAULT_MAX_FILES 12
#define VAULT_NAME_LEN 28
#define VAULT_SNIPPET_LEN 200

typedef struct {
  char name[VAULT_NAME_LEN];
} VaultFile;

// Call after notes_begin() so SD may already be mounted.
bool vault_refresh(void);
bool vault_available(void); // SD present and at least one note file found
int vault_file_count(void);
const char *vault_file_name(int index);

// Stream-read a file into out (capped). Returns bytes written.
size_t vault_read_file(int index, char *out, size_t out_cap);

// Case-insensitive substring search across vault files; fills out with hits.
// Does not load whole files into RAM — line-by-line scan.
size_t vault_search(const char *query, char *out, size_t out_cap);

const char *vault_root_hint(void); // path that was found, or explanation
