export default function ExtendedSearchHints() {
	return (
		<div className="is-centered has-text-centered">
			<div className="content is-size-3">Search Hints</div>
			<table
				className="table is-striped is-hoverable"
				style={{ marginLeft: "auto", marginRight: "auto" }}
			>
				<thead>
					<tr>
						<th>Token</th> <th>Match type</th> <th>Description</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>
							<code>jscript</code>
						</td>
						<td>fuzzy-match</td>
						<td>
							Items that fuzzy match <code>jscript</code>
						</td>
					</tr>
					<tr>
						<td>
							<code>=scheme</code>
						</td>
						<td>exact-match</td>
						<td>
							Items that are <code>scheme</code>
						</td>
					</tr>
					<tr>
						<td>
							<code>'python</code>
						</td>
						<td>include-match</td>
						<td>
							Items that include <code>python</code>
						</td>
					</tr>
					<tr>
						<td>
							<code>!ruby</code>
						</td>
						<td>inverse-exact-match</td>
						<td>
							Items that do not include <code>ruby</code>
						</td>
					</tr>
					<tr>
						<td>
							<code>^java</code>
						</td>
						<td>prefix-exact-match</td>
						<td>
							Items that start with <code>java</code>
						</td>
					</tr>
					<tr>
						<td>
							<code>!^earlang</code>
						</td>
						<td>inverse-prefix-exact-match</td>
						<td>
							Items that do not start with <code>earlang</code>
						</td>
					</tr>
					<tr>
						<td>
							<code>.js$</code>
						</td>
						<td>suffix-exact-match</td>
						<td>
							Items that end with <code>.js</code>
						</td>
					</tr>
					<tr>
						<td>
							<code>!.go$</code>
						</td>
						<td>inverse-suffix-exact-match</td>
						<td>
							Items that do not end with <code>.go</code>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
}
